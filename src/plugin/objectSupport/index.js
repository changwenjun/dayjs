export default (o, c) => {
  const proto = c.prototype
  const isObject = obj => !(obj instanceof Date) && !(obj instanceof Array) && obj instanceof Object
  const prettyUnit = (u) => {
    const unit = proto.$utils().p(u)
    return unit === 'date' ? 'day' : unit
  }
  const parseDate = (cfg) => {
    const { date, utc } = cfg
    const $d = {}
    if (isObject(date)) {
      Object.keys(date).forEach((k) => {
        $d[prettyUnit(k)] = date[k]
      })
      const y = $d.year || 1970
      const M = $d.month - 1 || 0
      const d = $d.day || 1
      const h = $d.hour || 0
      const m = $d.minute || 0
      const s = $d.second || 0
      const ms = $d.millisecond || 0
      if (utc) {
        return new Date(Date.UTC(y, M, d, h, m, s, ms))
      }
      return new Date(y, M, d, h, m, s, ms)
    }
    return date
  }

  const oldParse = proto.parse
  proto.parse = function (cfg) {
    cfg.date = parseDate.bind(this)(cfg)
    oldParse.bind(this)(cfg)
  }

  const oldSet = function (int, string) {
    return this.clone().$set(string, int)
  }
  const oldAdd = proto.add

  const callObject = function (call, argument, string, offset = 1) {
    if (argument instanceof Object) {
      const keys = Object.keys(argument)
      let chain = this
      keys.forEach((key) => {
        chain = call.bind(chain)(argument[key] * offset, key)
      })
      return chain
    }
    return call.bind(this)(argument * offset, string)
  }

  proto.set = function (string, int) {
    int = int === undefined ? string : int
    return callObject.bind(this)(oldSet, int, string)
  }
  proto.add = function (number, string) {
    return callObject.bind(this)(oldAdd, number, string)
  }
  proto.subtract = function (number, string) {
    return callObject.bind(this)(oldAdd, number, string, -1)
  }
}
