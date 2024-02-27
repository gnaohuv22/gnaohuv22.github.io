var notifications = [];
var maxNotifications = 5;

function showMsg(msg) {
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = '<span class="closebtn">×</span>' + msg;

    var container = document.getElementById('notification-container');
    container.appendChild(notification);

    var closebtn = notification.getElementsByClassName('closebtn')[0];

    // Show the notification
    notification.style.visibility = "visible";
    notification.style.opacity = "1";

    // Hide the notification after 5 seconds
    var timeoutID = setTimeout(function() {
        notification.style.opacity = "0";
        setTimeout(function() {
            container.removeChild(notification);
        }, 0);
    }, 5000);

    // If the close button is clicked, hide the notification and clear the timeout
    closebtn.onclick = function() {
        clearTimeout(timeoutID);
        notification.style.opacity = "0";
        setTimeout(function() {
            container.removeChild(notification);
        }, 0);
    }

    // Stop the timeout when the user hovers over the notification
    notification.onmouseover = function() {
        clearTimeout(timeoutID);
    }

    // Restart the timeout when the user stops hovering over the notification
    notification.onmouseout = function(e) {
        // Check if the mouse is still within the notification div
        if (!notification.contains(e.relatedTarget)) {
            timeoutID = setTimeout(function() {
                notification.style.opacity = "0";
                setTimeout(function() {
                    container.removeChild(notification);
                }, 0);
            }, 5000);
        }
    }

    // Add the new notification to the queue
    notifications.push({notification: notification, timeoutID: timeoutID});

    // If there are more than maxNotifications, remove the oldest one
    if (notifications.length > maxNotifications) {
        var oldNotification = notifications.shift();
        clearTimeout(oldNotification.timeoutID);
        oldNotification.notification.style.opacity = "0";
        setTimeout(function() {
            container.removeChild(oldNotification.notification);
        }, 0);
    }
}
