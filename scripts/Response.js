module.exports = (Request, Response) => {
    // add Search Engine Ignores
    Response.set('X-Robots-Tag', 'nofollow, noydir, noodp, noarchive, noindex');
    Response.set('X-Powered-By', 'Nginx+Express');
    Response.set('X-Authored-By', 'ArrayIterator');
    return Response;
};
