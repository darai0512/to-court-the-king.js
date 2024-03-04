export class FieldError extends Error {
  code: string
  constructor(e: string) {
    super(e)
    this.code = e
  }
}