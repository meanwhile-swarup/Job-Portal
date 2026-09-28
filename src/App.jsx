import { useState } from 'react'
import Navbar from './components/Navbar'
import Landing from './components/Landing'
import Trends from './components/TrendJobs'
import Statistics from './components/Statistics'
import AuthPage from './components/AuthPage'
import { Routes, Route } from "react-router-dom";
import Jobdetails from './components/Jobdetails'
import AppliedJobs from './components/AppliedJobs'
import CompanyDashboard from './components/CompanyDashboard'
import CreateEditJob from './components/CreateEditJob'
import ManageApplicants from './components/ManageApplicants'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './components/Profile'
import PublicProfile from './components/PublicProfile'



const App = () => {
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  return (
    <div className="flex flex-col min-h-screen justify-between bg-gray-50">
      <div>
        <Navbar />
        <Routes>
          <Route path="/"
            element={
              <>
                <Landing title={title} location={location} setTitle={setTitle} setLocation={setLocation}/>
                <Trends title={title} location={location}/>
                <Statistics />
              </>
            }
          />

          <Route path="/auth" element={<AuthPage />} />

          <Route path="/jobs/:id" element={<Jobdetails />} />

          <Route path="/applied" element={
            <ProtectedRoute allowedRole="seeker">
              <AppliedJobs />
            </ProtectedRoute>
          } />

          <Route path="/company" element={
            <ProtectedRoute allowedRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/company/jobs/new" element={
            <ProtectedRoute allowedRole="company">
              <CreateEditJob />
            </ProtectedRoute>
          } />
          <Route path="/company/jobs/:id/edit" element={
            <ProtectedRoute allowedRole="company">
              <CreateEditJob />
            </ProtectedRoute>
          } />
          <Route path="/company/jobs/:jobId/applicants" element={
            <ProtectedRoute allowedRole="company">
              <ManageApplicants />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/profiles/seeker/:id" element={
            <ProtectedRoute>
              <PublicProfile type="seeker" />
            </ProtectedRoute>
          } />
          
          <Route path="/profiles/company/:id" element={
            <PublicProfile type="company" />
          } />
            
          <Route path="*" element={<NotFound />} />
        </Routes> 
      </div>
      <Footer />
    </div>
  )
}

export default App