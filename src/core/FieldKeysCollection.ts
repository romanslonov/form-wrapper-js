export class FieldKeysCollection {
  /**
   * holds all the field keys
   */
  private _fieldKeys: string[] = []

  /**
   * returns all the field keys
   */
  public all(): string[] {
    return this._fieldKeys
  }

  /**
   * record fields keys on _fieldKeys array
   *
   * @param fieldsKeys
   */
  public record(fieldsKeys: string[]): FieldKeysCollection {
    this._fieldKeys = [...fieldsKeys]

    return this
  }

  /**
   * checks if field exists in _fieldKeys array
   *
   * @param fieldKey
   */
  public has(fieldKey: string): boolean {
    return this._fieldKeys.indexOf(fieldKey) > -1
  }

  /**
   * push field to the _fieldKeys array
   *
   * @param fieldKey
   */
  public push(fieldKey: string): FieldKeysCollection {
    if (this._fieldKeys.indexOf(fieldKey) < 0) {
      this._fieldKeys.push(fieldKey)
    }

    return this
  }

  /**
   * Clear the _fieldKeys array
   */
  public clear(): FieldKeysCollection {
    this._fieldKeys = []

    return this
  }

  /**
   * checks if there is any field key
   */
  public any(): boolean {
    return this._fieldKeys.length > 0
  }

  /**
   * remove field from the _fieldKeys array
   *
   * @param fieldKey
   */
  public unset(fieldKey: string): FieldKeysCollection {
    if (this.has(fieldKey)) {
      this._fieldKeys = this._fieldKeys.filter(
        existsFieldKey => existsFieldKey !== fieldKey
      )
    }

    return this
  }
}
