/**
 * A CLI-style argument parser.
 * @param str - the string to parse
 * @param options - the options for the parser
 * @param options.args - positional arguments
 * @param options.options - named arguments
 * @param options.transformer - a function to transform arguments
 * @returns the parsed arguments
 */
export function parse<T>(str: string, options: ArgumentParserOptions<T>): Promise<ArgumentParserResults<T>>;

/** A function to transform an argument to the correct data type. */
export type TransformFunction<T> = (value: string, argument: ArgumentParserArgumentData<T>, option?: ArgumentParserOptionData<T>) => Promise<T>

export interface ArgumentParserArgumentData<T> {
  /** The name of the argument. */
  name: string
  /** Whether the argument is required or not. */
  required?: boolean
  /** The function to use to transform the arguments to the correct data type. */
  transform?: TransformFunction<T>
}

export interface ArgumentParserOptionData<T> {
  /** The name of the option. */
  name: string
  /** The short name of the option. (should be a single letter.) */
  short?: string
  /** The arguments for this option. */
  args?: ArgumentParserArgumentData<T>[]
  /** The function to use to transform the arguments to the correct data type. */
  transform?: TransformFunction<T>
  /** Whether the option is required or not. */
  required?: boolean
}

/**
 * @typeParam T - The resolved type of arguments.
 */
export interface ArgumentParserOptions<T = any> {
  /** The positional arguments this parser should recognize. */
  args?: ArgumentParserArgumentData<T>[]
  /** The named options this parser should recognize. */
  options?: ArgumentParserOptionData<T>[]
  /** The function to use to transform the arguments to the correct data type. */
  transform?: TransformFunction<T>
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
  /** The raw input string. */
  raw: string
}