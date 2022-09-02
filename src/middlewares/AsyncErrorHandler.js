module.exports = (asyncFn) => (req, res, next) => {
    Promise.resolve(asyncFn(req, res, next)).catch(next)
}