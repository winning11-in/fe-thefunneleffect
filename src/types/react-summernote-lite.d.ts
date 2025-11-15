declare module 'react-summernote-lite' {
  import { ComponentType, Ref } from 'react'

  interface SummernoteOptions {
    height?: number
    placeholder?: string
    toolbar?: any[][]
    callbacks?: {
      onInit?: () => void
      onChange?: (contents: string) => void
      [key: string]: any
    }
    [key: string]: any
  }

  interface ReactSummernoteLiteProps {
    ref?: Ref<any>
    value?: string
    onChange?: (content: string) => void
    options?: SummernoteOptions
  }

  const ReactSummernoteLite: ComponentType<ReactSummernoteLiteProps>
  export default ReactSummernoteLite
}