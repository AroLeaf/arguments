/**
 * A CLI-style argument parser.
 * @param str - the string to parse
 * @param options - the options for the parser
 * @param options.args - positional arguments
 * @param options.options - named arguments
 * @param options.transformer - a function to transform arguments
 * @returns the parsed arguments
 */
export async function parse<T>(str: string, { args = [], options = [], transformer = async arg => <T>arg }: ArgumentParserResults<T> = {});


export interface ArgumentParserArgumentData {
  /** The name of the argument. */
  name: string
  /** Whether the argument is required or not. */
  required?: boolean
}

export interface ArgumentParserOptionData {
  /** The name of the option. */
  name: string
  /** The short name of the option. (should be a single letter.) */
  short?: string
  /** The arguments for this option. */
  args?: ArgumentParserArgumentData[]
  /** Whether the option is required or not. */
  required?: boolean
}

/**
 * @typeParam T - The resolved type of arguments.
 */
export interface ArgumentParserOptions<T = any> {
  /** The positional arguments this parser should recognize. */
  args?: ArgumentParserArgumentData[]
  /** The named options this parser should recognize. */
  options?: ArgumentParserOptionData[]
  /** The function to use to transform the arguments to the correct data types. */
  transformer?: (arg: string, name: string, option?: string) => Promise<T>
}

/**
 * @typeParam T - The resolved type of arguments.
 */
export interface ArgumentParserResultArguments<T> {
  [key: string]: T
}

/**
 * @typeParam T - The resolved type of arguments.
 */
export interface ArgumentParserResults<T> {
  /** The positional arguments found. */
  args: ArgumentParserResultArguments<T>
  /** The named options found. */
  options: {
    [key: string]: ArgumentParserResultArguments<T> | T | boolean
  }
  /** All arguments after the first loose `--`. */
  rest?: string
}