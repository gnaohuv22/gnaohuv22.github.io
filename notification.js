function showNotification(msg) {
    let notification = document.getElementById("notification");
    let closebtn = document.getElementById("closebtn");
    notification.style.display = "block";
    // closebtn.style.display = "block";
    notification.textContent = msg;
    setTimeout(function () {
        notification.style.display = "none";
        // closebtn.style.display = "none";
    }, 5000);
}
