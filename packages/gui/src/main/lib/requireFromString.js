export default (src, filename = "") => {
    var Module = module.constructor
    var newModule = new Module()

    newModule._compile(src, filename)

    return newModule.exports
}