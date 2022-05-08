export class InputRegex {
	public static readonly LIMIT_99: RegExp = /^\d{0,2}$/;
	public static readonly LIMIT_59: RegExp = /^[0-5]?[0-9]?$/;
	public static readonly LIMIT_99_9: RegExp = /^(\d{0,2}|\d{1,2}\.\d?)$/;
	public static readonly LIMIT_9999: RegExp = /^\d{0,4}$/;
}
