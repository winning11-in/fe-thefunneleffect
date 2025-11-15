import { forwardRef, useImperativeHandle, useRef, useEffect, useState, lazy, Suspense } from 'react'
import 'react-summernote-lite/dist/font/summernote.ttf';
import 'react-summernote-lite/dist/summernote-lite.min.css';

// Import jQuery properly
import $ from 'jquery'

// Declare jQuery on window
declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
  }
}

window.$ = $
window.jQuery = $

// Lazy load ReactSummernoteLite to avoid build issues
const ReactSummernoteLite = lazy(() => import('react-summernote-lite'))

interface SummernoteEditorProps {
  value?: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
}

export interface SummernoteEditorRef {
  getContent: () => string
}

const SummernoteEditor = forwardRef<SummernoteEditorRef, SummernoteEditorProps>(
  ({ value, onChange, placeholder = 'Enter content...', height = 300 }, ref) => {
    const editorRef = useRef<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
      if (editorRef.current && value !== undefined && isLoaded) {
        const currentContent = editorRef.current.summernote('code')
        if (currentContent !== value) {
          editorRef.current.summernote('code', value)
        }
      }
    }, [value, isLoaded])

    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (editorRef.current && isLoaded) {
          return editorRef.current.summernote('code')
        }
        return value || ''
      }
    }))

    return (
      <Suspense fallback={<div>Loading editor...</div>}>
        <ReactSummernoteLite
          ref={(el: any) => {
            editorRef.current = el
            if (el && !isLoaded) setIsLoaded(true)
          }}
          options={{
            height: height,
            placeholder: placeholder,
            toolbar: [
              ['style', ['style']],
              ['font', ['bold', 'underline', 'italic', 'strikethrough', 'superscript', 'subscript', 'clear']],
              ['fontname', ['fontname']],
              ['fontsize', ['fontsize']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['table', ['table']],
              ['insert', ['link', 'picture', 'video', 'hr']],
              ['view', ['fullscreen', 'codeview', 'help']]
            ],
            callbacks: {
              onInit: function() {
                if (value) {
                  editorRef.current.summernote('code', value)
                }
              },
              onChange: function(contents: string) {
                console.log('Summernote onChange callback:', contents)
                onChange(contents)
              },
              onBlur: function() {
                const contents = editorRef.current.summernote('code')
                onChange(contents)
              }
            }
          }}
        />
      </Suspense>
    )
  }
)

SummernoteEditor.displayName = 'SummernoteEditor'

export default SummernoteEditor