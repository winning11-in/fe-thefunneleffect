import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import PageList from './pages/PageList'
import PageForm from './pages/PageForm'
import PagePreview from './pages/PagePreview'
import TrackList from './pages/TrackList'
import TrackForm from './pages/TrackForm'
import PlaylistList from './pages/PlaylistList'
import PlaylistForm from './pages/PlaylistForm'
import PlaylistDetail from './pages/PlaylistDetail'
import Images from './pages/Images'
import Audios from './pages/Audios'
import FolderAudios from './pages/FolderAudios'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ minHeight: '100vh'}}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/pages" element={<PageList />} />
                    <Route path="/pages/new" element={<PageForm />} />
                    <Route path="/pages/edit/:id" element={<PageForm />} />
                    <Route path="/pages/preview/:slug" element={<PagePreview />} />
                    <Route path="/tracks" element={<TrackList />} />
                    <Route path="/tracks/new" element={<TrackForm />} />
                    <Route path="/tracks/:id/edit" element={<TrackForm />} />
                    <Route path="/playlists" element={<PlaylistList />} />
                    <Route path="/playlists/new" element={<PlaylistForm />} />
                    <Route path="/playlists/:id" element={<PlaylistDetail />} />
                    <Route path="/playlists/:id/edit" element={<PlaylistForm />} />
                    <Route path="/images" element={<Images />} />
                    <Route path="/audios" element={<Audios />} />
                    <Route path="/audios/folder/:folderPath" element={<FolderAudios />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  )
}

export default App