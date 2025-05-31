using FluentValidation;
using FluentValidation.Results; // Нужен для ValidationResult и ValidationFailure
using kamsoft.Patterms; // Нужно для IMediatorResult и MediatorResult
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// Поместите этот класс в подходящую папку, например Infrastructure/Pipeline

namespace kamsoft.Infrastructure.Pipeline
{
    // Поведение валидации для запросов, возвращающих MediatorResult<TData>
    // <TRequest> - тип команды/запроса
    // <TData> - тип данных в результате IMediatorResult
    // TResponse теперь явно MediatorResult<TData>
    public class ValidationResultBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationResultBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var context = new ValidationContext<TRequest>(request);

            var failures = _validators
                .Select(v => v.Validate(context))
                .SelectMany(result => result.Errors)
                .Where(f => f != null)
                .ToList();

            if (failures.Count != 0)
            {
                var errorMessage = string.Join("; ", failures.Select(f => f.ErrorMessage));

                // Проверяем, является ли TResponse типом, реализующим IMediatorResult<>
                var isMediatorResult = typeof(TResponse).GetInterfaces().Any(i => 
                    i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IMediatorResult<>));

                if (isMediatorResult)
                {
                    // Если реализует IMediatorResult<>, пытаемся создать Failure результат
                    // Получаем тип данных из IMediatorResult<TData>
                    var mediatorResultInterface = typeof(TResponse).GetInterfaces().First(i => 
                         i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IMediatorResult<>));
                    var innerType = mediatorResultInterface.GetGenericArguments()[0];

                    // Создаем MediatorResult<T>.Failure(string)
                    var failureMethod = typeof(MediatorResult<>) // Используем MediatorResult<> (конкретный класс) для вызова статического метода
                        .MakeGenericType(innerType)
                        .GetMethod("Failure", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);

                    return (TResponse)failureMethod.Invoke(null, new object[] { errorMessage });

                }
                else
                {
                    // Иначе — кинь исключение, как обычно
                    throw new ValidationException(failures);
                }
            }

            return await next();
        }
    }

}