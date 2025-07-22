import { Users, Target, Zap, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About MockTestAI</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing the way students and educators create and take mock tests by leveraging the power of
            artificial intelligence to transform any PDF into comprehensive, interactive assessments.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              At MockTestAI, we believe that effective learning comes through practice and assessment. Our mission is to
              make high-quality mock tests accessible to everyone by automating the test creation process.
            </p>
            <p className="text-lg text-gray-600">
              Whether you're a student preparing for exams, an educator creating assessments, or a professional studying
              for certifications, we provide the tools to transform your study materials into engaging, comprehensive
              mock tests in minutes.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
            <img src="/placeholder.svg?height=400&width=500" alt="Our Mission" className="w-full h-auto rounded-lg" />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We ensure our AI generates relevant, accurate questions that truly test understanding
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Save hours of manual work with our instant PDF to mock test conversion
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Making quality educational tools available to students and educators worldwide
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Continuously improving our AI to deliver the best possible learning experience
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Your PDF</h3>
              <p className="text-gray-600">
                Simply upload any PDF document containing the material you want to create a test from. Our system
                supports various document types and formats.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your document, identifies key concepts, and generates diverse question types
                including multiple choice, true/false, and short answers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Your Test</h3>
              <p className="text-gray-600">
                Receive your personalized mock test instantly. Take it online, download it, or share it with others.
                Track your progress and improve your performance.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Built by Educators, for Educators</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Our team combines expertise in education, artificial intelligence, and software development to create tools
            that truly understand the needs of learners and educators.
          </p>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Learning?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of students and educators who are already using MockTestAI to enhance their learning
              experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
