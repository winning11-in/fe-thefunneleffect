import { forwardRef, useImperativeHandle, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface QuillEditorProps {
  value?: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
}

export interface QuillEditorRef {
  getContent: () => string
}

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
  ({ value, onChange, placeholder = 'Enter content...', height = 300 }, ref) => {
    const editorRef = useRef<ReactQuill>(null)

    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (editorRef.current) {
          return editorRef.current.getEditor().root.innerHTML
        }
        return value || ''
      }
    }))

    const modules = {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean']
      ],
    }

    const formats = [
      'header', 'bold', 'italic', 'underline', 'strike',
      'list', 'bullet', 'script', 'indent', 'color', 'background',
      'align', 'link', 'image', 'video', 'blockquote', 'code-block'
    ]

    return (
      <div style={{ height: `${height}px` }}>
        <ReactQuill
          ref={editorRef}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{ height: `${height - 42}px` }} // Subtract toolbar height
        />
      </div>
    )
  }
)

QuillEditor.displayName = 'QuillEditor'

export default QuillEditor