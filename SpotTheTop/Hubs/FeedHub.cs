namespace SpotTheTop.Api.Hubs
{
    using Microsoft.AspNetCore.SignalR;
    using System.Threading.Tasks;

    // Този клас може да е напълно празен за момента!
    // Цялата магия идва от наследяването на базовия клас Hub.
    public class FeedHub : Hub
    {
        // По-късно тук можем да добавим методи, ако искаме клиентите 
        // директно да викат бекенда през WebSockets, но обикновено 
        // бекендът (FeedService) е този, който избутва данните към клиентите.
    }
}