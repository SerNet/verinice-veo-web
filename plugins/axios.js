export default ({ $axios, store }, inject) => {
    $axios.setHeader('Content-Type', 'application/json', ['post']);
    $axios.onRequest(config => {
        const authorizationHeader = store.getters['auth/authorizationHeader'];
        if(authorizationHeader) {
            config.headers.common['Authorization'] = authorizationHeader;
        } else {
            delete config.headers.common['Authorization'];
        } 
        console.debug(config.method.toUpperCase()+' '+config.url);
    })
}