// Check if username is set, else redirect to login
if (!localStorage.getItem('username')) {
    window.location.href = '/auth/login';
}

function handleLogout(event) {
    event.preventDefault();
    fetch('/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
    }).then(() => {
        localStorage.setItem('username', null);
        window.location.href = '/auth/login';
    });
}
