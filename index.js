const { Lexer } = require('@aroleaf/parser');

const lexer = new Lexer({
  flags: /-([a-zA-Z]+)/,
  flag: /--([a-zA-Z][-a-zA-Z]*)/,
  rest: /--(?:\s+|$)(.*)/s,
  arg: {
    matches: /(?:\\.|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\S)+/s,
    then: t => t.value = t.value
      .replace(/(?<!\\)((?:\\\\)*)(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g, (...m) => m[1] + (m[3] || m[2]))
      .replace(/\\(.)/sg, '$1')
  },
  whitespace: {
    matches: /\s+/,
    discard: true,
  },
});


module.exports = async function parse(str, { args = [], options = [], transform = arg => arg } = {}) {
  const tokens = lexer.parse(str);
  
  const out = {
    args: {},
    options: {},
    raw: str,
  }

  let currentToken = 0;
  let currentArg = 0;

  async function parseOption(optionData) {
    if (!optionData.args?.length) {
      const value = await [
        optionData.transform?.bind(optionData),
        transform,
      ].find(f => f)?.(true, optionData);
      return value;
    };
    
    let option = {};
    
    for (const argumentData of optionData.args) {
      const token = tokens[currentToken];
      if (token?.type !== 'arg') {
        if (argumentData.required) throw new Error(`Missing required argument \`${argumentData.name}\` for option \`${optionData.name}\`.`);
        currentToken++;
        continue;
      }
      const value = await [
        argumentData.transform?.bind(argumentData),
        optionData.transform?.bind(optionData),
        transform,
      ].find(f => f)?.(token.value, argumentData, optionData);
      if (value === undefined) continue;
      currentToken++;
      if (optionData.args.length === 1 && optionData.name === argumentData.name) return value;
      option[argumentData.name] = value;
    }

    return option;
  }

  while (tokens[currentToken]) {
    const { type, value } = tokens[currentToken];
    switch(type) {
      case 'flags': {
        currentToken++;
        for (const short of value) {
          const optionData = options.find(opt => opt.short === short);
          if (!optionData) throw new Error(`Unknown short flag \`${short}\`.`);
          out.options[optionData.name] = await parseOption(optionData);
        }
        break;
      }

      case 'flag': {
        currentToken++;
        const optionData = options.find(opt => opt.name === value);
        if (!optionData) throw new Error(`Unknown flag \`${value}\`.`);
        out.options[optionData.name] = await parseOption(optionData);
        break;
      }

      case 'arg': {
        const argumentData = args[currentArg];
        if (!argumentData) {
          currentToken++;
          continue;
        }
        const res = await [
          argumentData.transform?.bind(argumentData),
          transform,
        ].find(f => f)?.(tokens[currentToken].value, argumentData);
        if (res != null) {
          out.args[argumentData.name] = res;
          currentToken++;
        }
        currentArg++;
        break;
      }

      case 'rest': {
        out.rest = value;
        currentToken++;
      }
    }
  }

  for (const option of options) if (!out.options[option.name] && option.required) {
    throw new Error(`Missing required option \`${option.name}\`.`);
  }

  for (const arg of args) if (!out.args[arg.name] && arg.required) {
    throw new Error(`Missing required argument \`${arg.name}\`.`);
  }

  return out;
}