// Function to upload PDF with progress tracking
export async function uploadPDF(file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData()
  formData.append("pdfFile", file)

  const token = localStorage.getItem("token") // Assuming token is stored in localStorage
  if (!token) {
    throw new Error("Authentication token not found. Please log in.")
  }

  return new Promise(async (resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total)
          onProgress(percentCompleted)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            reject(new Error(errorData.error || "Upload failed"))
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`))
          }
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload."))
      })

      xhr.open("POST", "http://localhost:5000/api/upload/pdf")
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      xhr.send(formData)
    } catch (error) {
      reject(error)
    }
  })
}

// Function to make authenticated requests
export async function makeAuthenticatedRequest(endpoint: string, options?: RequestInit): Promise<Response | undefined> {
  const token = localStorage.getItem("token")
  if (!token) {
    // Redirect to login or handle unauthenticated state
    console.error("No authentication token found.")
    // Optionally, redirect to login page
    // window.location.href = "/login";
    return undefined
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options?.headers,
  }

  try {
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      ...options,
      headers,
    })

    // Handle token expiration or invalid token
    if (response.status === 401 || response.status === 403) {
      console.error("Authentication failed or token expired. Please log in again.")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      // Optionally, redirect to login page
      // window.location.href = "/login";
      return undefined
    }

    return response
  } catch (error) {
    console.error("Error making authenticated request:", error)
    throw error
  }
}
