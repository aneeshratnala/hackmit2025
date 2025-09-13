import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">StudyVideo AI</h1>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              You&apos;ve successfully signed up for StudyVideo AI. Please check your email to confirm your account
              before signing in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
