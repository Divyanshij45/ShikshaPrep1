"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Eye,
  Download,
  Trash2,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProtectedRoute } from "@/components/protected-route";
import { FileUpload } from "@/components/file-upload"; // Corrected import path
import { useAuth } from "@/contexts/auth-context";
import { makeAuthenticatedRequest } from "@/utils/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MockTest {
  _id: string;
  name: string;
  originalFileName: string;
  questions: number;
  status: "processing" | "completed" | "failed";
  createdAt: string;
  lastTaken?: string;
  score?: number;
}

interface DashboardStats {
  totalTests: number;
  totalQuestions: number;
  testsTaken: number;
  averageScore: number;
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    totalQuestions: 0,
    testsTaken: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const { user } = useAuth();

  // Use useRef to persist the interval ID across renders
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch mock tests
      const testsResponse = await makeAuthenticatedRequest("/tests");
      if (testsResponse) {
        const testsData = await testsResponse.json();
        setMockTests(testsData.tests || []);

        // Check if any tests are still processing
        const anyProcessing = (testsData.tests || []).some(
          (test: MockTest) => test.status === "processing"
        );

        // If there are processing tests and polling is not active, start it
        if (anyProcessing && !pollingIntervalRef.current) {
          console.log("Starting polling for test updates...");
          pollingIntervalRef.current = setInterval(() => {
            fetchDashboardData(); // Call itself to re-fetch
          }, 8000); // Poll every 8 seconds
        }
        // If no tests are processing and polling is active, stop it
        else if (!anyProcessing && pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          console.log("All tests processed, stopped polling.");
        }

        // Calculate stats from the data
        const totalTests = testsData.tests?.length || 0;
        const totalQuestions =
          testsData.tests?.reduce(
            (sum: number, test: MockTest) => sum + test.questions,
            0
          ) || 0;
        const testsTaken =
          testsData.tests?.filter((test: MockTest) => test.lastTaken).length ||
          0;
        const averageScore =
          testsData.tests?.reduce(
            (sum: number, test: MockTest) => sum + (test.score || 0),
            0
          ) / Math.max(testsTaken, 1) || 0;

        setStats({
          totalTests,
          totalQuestions,
          testsTaken,
          averageScore: Math.round(averageScore),
        });
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchDashboardData();
    // Cleanup interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const handleUploadSuccess = (result: any) => {
    setUploadSuccess(
      "PDF uploaded successfully! Your mock test is being generated."
    );
    setError("");
    // Add the new test to the list
    const newTest: MockTest = {
      _id: result.testId, // Use testId from the backend response
      name: result.name, // Use name from the backend response
      originalFileName: result.originalFileName, // Use originalFileName from backend
      questions: 0, // Will be updated when processing completes
      status: "processing",
      createdAt: result.createdAt, // Use createdAt from backend
    };
    setMockTests((prev) => [newTest, ...prev]);
    // Update stats
    setStats((prev) => ({
      ...prev,
      totalTests: prev.totalTests + 1,
    }));
    // Ensure polling starts if it's not already
    if (!pollingIntervalRef.current) {
      fetchDashboardData(); // Trigger an immediate fetch to start polling if needed
    }
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setUploadSuccess("");
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const response = await makeAuthenticatedRequest(`/tests/${testId}`, {
        method: "DELETE",
      });
      if (response?.ok) {
        setMockTests((prev) => prev.filter((test) => test._id !== testId));
        setStats((prev) => ({
          ...prev,
          totalTests: prev.totalTests - 1,
        }));
        fetchDashboardData();
      }
    } catch (err) {
      setError("Failed to delete test");
    }
  };

  const handleTakeTest = (testId: string) => {
    // Navigate to test taking page
    window.location.href = `/test/${testId}`;
  };

  const handleDownloadTest = async (testId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/tests/${testId}/download`
      );
      if (response?.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mock-test-${testId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError("Failed to download test");
    }
  };

  const filteredTests = useMemo(() => {
    return mockTests.filter(
      (test) =>
        test?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test?.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mockTests, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back,{" "}
              {<span className="!capitalize">{user?.username}</span>}!{" "}
              {/* User's name is now consistently available */}
            </h1>
            <p className="text-gray-600">
              Upload PDFs and generate mock tests with AI
            </p>
          </div>
          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {uploadSuccess && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{uploadSuccess}</AlertDescription>
            </Alert>
          )}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tests
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <p className="text-xs text-muted-foreground">
                  Mock tests created
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Questions Generated
                </CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">
                  AI-generated questions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tests Taken
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.testsTaken}</div>
                <p className="text-xs text-muted-foreground">
                  Completed attempts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Overall performance
                </p>
              </CardContent>
            </Card>
          </div>
          {/* File Upload Section */}
          <div className="mb-8">
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
          {/* Tests Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Your Mock Tests</CardTitle>
                  <CardDescription>
                    View and manage all your generated mock tests
                  </CardDescription>
                </div>
                <div className="flex justify-between gap-2">
                  <Button onClick={fetchDashboardData} variant="outline">
                    <RefreshCcw />
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search tests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTests.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No mock tests yet
                  </h3>
                  <p className="text-gray-600">
                    Upload your first PDF to get started!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Original File</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow key={test._id}>
                        <TableCell className="font-medium">
                          {test.name}
                        </TableCell>
                        <TableCell>{test.originalFileName}</TableCell>
                        <TableCell>{test.questions || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(test.status)}
                            <Badge
                              variant={
                                test.status === "completed"
                                  ? "default"
                                  : test.status === "processing"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {test.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(test.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTakeTest(test._id)}
                              disabled={test.status !== "completed"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadTest(test._id)}
                              disabled={test.status !== "completed"}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTest(test._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
