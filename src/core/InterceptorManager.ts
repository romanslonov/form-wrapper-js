import { IInterceptorHandler } from '../types/Interceptors'

export class InterceptorManager {
  /**
   * holds all the function that should run on the chain
   */
  private _handlers: IInterceptorHandler[] = []

  /**
   * constructor
   *
   * @param handlers
   */
  constructor(handlers: IInterceptorHandler[] = []) {
    this.merge(handlers)
  }

  /**
   * adding function to the handlers chain
   * and returns the position of the handler in the chain
   *
   * @param fulfilled
   * @param rejected
   */
  public use(
    fulfilled: (response: any) => any | null,
    rejected: (error: any) => any | null = null
  ): number {
    this._handlers.push({
      fulfilled,
      rejected,
    })

    return this._handlers.length - 1
  }

  /**
   * eject a handler from the chain, by his position.
   *
   * @param position
   */
  public eject(position: number): void {
    if (this._handlers[position]) {
      this._handlers[position] = null
    }
  }

  /**
   * letting you merge more interceptors to the handlers array
   * NOTICE: this will put the interceptors at the BEGINNING of the chain
   *
   * @param interceptors
   */
  public merge(interceptors: IInterceptorHandler[]): InterceptorManager {
    this._handlers = [...interceptors, ...this._handlers]

    return this
  }

  /**
   * return all the handlers
   */
  public all(): IInterceptorHandler[] {
    return this._handlers
  }

  /**
   * run over the handlers
   *
   * @param func
   */
  public forEach(func: (handler: IInterceptorHandler) => any): void {
    this._handlers.forEach((handler: IInterceptorHandler) => {
      if (handler !== null) {
        func(handler)
      }
    })
  }
}
