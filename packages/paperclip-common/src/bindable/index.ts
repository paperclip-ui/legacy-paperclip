class PropertyBinding<
  TShape extends Object,
  TKey extends keyof TShape,
  TValue = TShape[TKey]
> {
  private _oldValue: any;
  constructor(
    private _object: BindableObject<TShape>,
    private _name: TKey,
    private _listener: (newValue: TValue, oldValue: TValue) => void
  ) {
    this._trigger();
  }
  private _trigger() {
    const newValue = this._object.properties[this._name] as any;
    if (newValue !== this._oldValue) {
      this._oldValue = newValue;
      this._listener(newValue, this._oldValue);
    }
  }
}

export class BindableObject<TShape extends Object> {
  constructor(private _properties: TShape) {}
  get properties() {
    return this._properties;
  }
  setProperties(properties: Partial<TShape>) {
    this._properties = Object.freeze({ ...this._properties, ...properties });
  }
  bindProperty<TKey extends keyof TShape>(
    name: TKey,
    listener: (value: TShape[TKey], oldValue: TShape[TKey]) => void
  ) {
    return new PropertyBinding(this, name, listener);
  }
}
