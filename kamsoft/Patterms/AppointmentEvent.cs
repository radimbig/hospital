using System.Text.Json;
using kamsoft.Models;


namespace kamsoft.Patterms
{
    public class AppointmentEvent
    {
        public ActionTypes ActionType { get; set; }
        public DateTime CreatedAt { get; set; }
        public Appointment Appointment { get; set; }
        

        public AppointmentEvent(ActionTypes actionType, DateTime createdAt, Appointment appointment)
        {
            ActionType = actionType;
            CreatedAt = createdAt;
            Appointment = appointment;
        }

        public static AppointmentEvent? ApointmentActionFromJson(string json)
        {
            return JsonSerializer.Deserialize<AppointmentEvent>(json);
        }
        public string ToJson()
        {
            return JsonSerializer.Serialize(this);
        }
    }
    

    public enum ActionTypes
    {
        AppointmentCreate,
        AppointmentDelete,
    }
}
