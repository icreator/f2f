// @flow

declare module 'qr-code-with-logo' {
  declare module.exports: {
    toCanvas: ({
      canvas: HTMLCanvasElement,
      content: string,
      width: number,
      logo: {
        src: string,
        logoSize: number,
        borderSize: number,
        borderRadius: number
      }
    }) => void
  }
}
