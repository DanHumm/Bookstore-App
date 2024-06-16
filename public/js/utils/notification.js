function showNotification(notification, isAnimating) {

    if(isAnimating) {
        return;
    }
    isAnimating = true;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
        isAnimating = false;
    }, 3000)
   
}


export default showNotification;