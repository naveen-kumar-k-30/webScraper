export const isProd = () => {
    if (window.location.hostname === 'localhost') {
        return false;
    }
    return true;
}