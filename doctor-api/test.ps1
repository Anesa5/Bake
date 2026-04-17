# Create corrected test.ps1
@"
Write-Host "=========================================="
Write-Host "DOCTOR API TESTER"
Write-Host "=========================================="
Write-Host ""

# Base URL
`$baseUrl = "http://localhost:5000"

# Test 1: Check if API is running
Write-Host "1. Testing API Status..." -ForegroundColor Cyan
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/" -Method Get
    Write-Host "   ✅ API is running!" -ForegroundColor Green
    Write-Host "   Message: `$(`$response.message)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API is not running!" -ForegroundColor Red
    Write-Host "   Error: `$_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "2. Testing Authentication..." -ForegroundColor Cyan

# Test 2: Register a new user (Admin)
Write-Host "   Registering admin user..." -ForegroundColor Yellow
`$registerData = @{
    username = "admin"
    email = "admin@doctor.com"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/auth/register" -Method Post -Body `$registerData -ContentType "application/json"
    Write-Host "   ✅ Admin registered successfully!" -ForegroundColor Green
    Write-Host "   Token: `$(`$response.data.token)" -ForegroundColor Green
    `$token = `$response.data.token
} catch {
    Write-Host "   ⚠️ Registration failed (might already exist): `$_" -ForegroundColor Yellow
    
    # Try to login instead
    Write-Host "   Trying to login..." -ForegroundColor Yellow
    `$loginData = @{
        email = "admin@doctor.com"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        `$response = Invoke-RestMethod -Uri "`$baseUrl/api/auth/login" -Method Post -Body `$loginData -ContentType "application/json"
        Write-Host "   ✅ Login successful!" -ForegroundColor Green
        `$token = `$response.data.token
    } catch {
        Write-Host "   ❌ Login failed: `$_" -ForegroundColor Red
        `$token = ""
    }
}

Write-Host ""
Write-Host "3. Testing Doctor Endpoints..." -ForegroundColor Cyan

# Test 3: Get all doctors
Write-Host "   Getting all doctors..." -ForegroundColor Yellow
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors" -Method Get
    Write-Host "   ✅ Found `$(`$response.count) doctors" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to get doctors: `$_" -ForegroundColor Red
}

# Test 4: Get specializations
Write-Host "   Getting specializations..." -ForegroundColor Yellow
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors/specializations" -Method Get
    Write-Host "   ✅ Specializations: `$(`$response.data -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to get specializations: `$_" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Creating Test Doctors..." -ForegroundColor Cyan

# Create headers with token if available
`$headers = @{}
if (`$token) {
    `$headers = @{
        "Authorization" = "Bearer `$token"
    }
}

# Test 5: Create Dermatologist
Write-Host "   Creating Dermatologist..." -ForegroundColor Yellow
`$dermatologist = @{
    name = "Dr. Sarah Johnson"
    specialization = "Dermatologist"
    description = "Specializes in skin diseases, cosmetic procedures, and skin cancer treatment. Expert in acne, eczema, and psoriasis."
    qualifications = @("MD Dermatology", "MBBS", "Board Certified Dermatologist")
    experience = 10
    clinicName = "Skin Care Clinic"
    clinicAddress = "123 Health Street, Manhattan"
    city = "New York"
    pincode = "10001"
    consultationFee = 150
    availability = @(
        @{day = "Monday"; startTime = "09:00"; endTime = "17:00"},
        @{day = "Wednesday"; startTime = "09:00"; endTime = "17:00"},
        @{day = "Friday"; startTime = "10:00"; endTime = "16:00"}
    )
    contact = @{
        phone = "+1-234-567-8900"
        email = "sarah.johnson@skinclinic.com"
    }
    services = @("Acne Treatment", "Skin Allergy", "Laser Therapy", "Cosmetic Dermatology", "Skin Cancer Screening")
    rating = 4.5
    isAvailable = `$true
} | ConvertTo-Json

try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors" -Method Post -Body `$dermatologist -ContentType "application/json" -Headers `$headers
    Write-Host "   ✅ Dermatologist created! ID: `$(`$response.data._id)" -ForegroundColor Green
    `$dermId = `$response.data._id
} catch {
    Write-Host "   ❌ Failed to create dermatologist: `$_" -ForegroundColor Red
    `$dermId = ""
}

# Test 6: Create Gynecologist
Write-Host "   Creating Gynecologist..." -ForegroundColor Yellow
`$gynecologist = @{
    name = "Dr. Maria Garcia"
    specialization = "Gynecologist"
    description = "Women's health specialist with expertise in pregnancy care, reproductive health, and menopause management."
    qualifications = @("MD Gynecology", "MBBS", "Fellowship in Reproductive Medicine")
    experience = 15
    clinicName = "Women's Wellness Center"
    clinicAddress = "456 Care Avenue, Boston"
    city = "Boston"
    pincode = "02101"
    consultationFee = 200
    availability = @(
        @{day = "Tuesday"; startTime = "08:00"; endTime = "18:00"},
        @{day = "Thursday"; startTime = "08:00"; endTime = "18:00"},
        @{day = "Saturday"; startTime = "09:00"; endTime = "14:00"}
    )
    contact = @{
        phone = "+1-234-567-8901"
        email = "maria.garcia@womensclinic.com"
    }
    services = @("Pregnancy Care", "Menopause Management", "Fertility Treatment", "Pap Smear", "Family Planning")
    rating = 4.8
    isAvailable = `$true
} | ConvertTo-Json

try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors" -Method Post -Body `$gynecologist -ContentType "application/json" -Headers `$headers
    Write-Host "   ✅ Gynecologist created! ID: `$(`$response.data._id)" -ForegroundColor Green
    `$gynId = `$response.data._id
} catch {
    Write-Host "   ❌ Failed to create gynecologist: `$_" -ForegroundColor Red
    `$gynId = ""
}

# Test 7: Create General Physician
Write-Host "   Creating General Physician..." -ForegroundColor Yellow
`$physician = @{
    name = "Dr. Robert Wilson"
    specialization = "General Physician"
    description = "General practitioner providing comprehensive healthcare for all ages. Expert in chronic disease management and preventive care."
    qualifications = @("MD General Medicine", "MBBS", "Diploma in Family Medicine")
    experience = 12
    clinicName = "Family Health Clinic"
    clinicAddress = "789 Wellness Road, Chicago"
    city = "Chicago"
    pincode = "60601"
    consultationFee = 100
    availability = @(
        @{day = "Monday"; startTime = "08:00"; endTime = "20:00"},
        @{day = "Tuesday"; startTime = "08:00"; endTime = "20:00"},
        @{day = "Wednesday"; startTime = "08:00"; endTime = "20:00"},
        @{day = "Thursday"; startTime = "08:00"; endTime = "20:00"},
        @{day = "Friday"; startTime = "08:00"; endTime = "18:00"}
    )
    contact = @{
        phone = "+1-234-567-8902"
        email = "robert.wilson@familyclinic.com"
    }
    services = @("General Checkup", "Vaccination", "Chronic Disease Management", "Health Screening", "Minor Procedures")
    rating = 4.3
    isAvailable = `$true
} | ConvertTo-Json

try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors" -Method Post -Body `$physician -ContentType "application/json" -Headers `$headers
    Write-Host "   ✅ General Physician created! ID: `$(`$response.data._id)" -ForegroundColor Green
    `$physId = `$response.data._id
} catch {
    Write-Host "   ❌ Failed to create general physician: `$_" -ForegroundColor Red
    `$physId = ""
}

Write-Host ""
Write-Host "5. Testing Filtering and Search..." -ForegroundColor Cyan

# Test 8: Get doctors by specialization
Write-Host "   Getting Dermatologists..." -ForegroundColor Yellow
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors/specialization/Dermatologist" -Method Get
    Write-Host "   ✅ Found `$(`$response.count) Dermatologist(s)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: `$_" -ForegroundColor Red
}

# Test 9: Search doctors
Write-Host "   Searching for 'Skin'..." -ForegroundColor Yellow
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors?search=skin" -Method Get
    Write-Host "   ✅ Found `$(`$response.count) doctor(s) with 'skin'" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: `$_" -ForegroundColor Red
}

Write-Host ""
Write-Host "6. Testing Single Doctor Endpoint..." -ForegroundColor Cyan

if (`$dermId) {
    Write-Host "   Getting Dermatologist details..." -ForegroundColor Yellow
    try {
        `$response = Invoke-RestMethod -Uri "`$baseUrl/api/doctors/`$dermId" -Method Get
        Write-Host "   ✅ Doctor found: `$(`$response.data.name)" -ForegroundColor Green
        Write-Host "   Specialization: `$(`$response.data.specialization)" -ForegroundColor Green
        Write-Host "   Clinic: `$(`$response.data.clinicName)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: `$_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "TEST COMPLETED"
Write-Host "=========================================="

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "1. Open browser to: http://localhost:5000" -ForegroundColor Yellow
Write-Host "2. View all doctors: http://localhost:5000/api/doctors" -ForegroundColor Yellow
Write-Host "3. View specializations: http://localhost:5000/api/doctors/specializations" -ForegroundColor Yellow
Write-Host "4. Test with filters: http://localhost:5000/api/doctors?specialization=Dermatologist" -ForegroundColor Yellow
Write-Host "5. Test with search: http://localhost:5000/api/doctors?search=skin" -ForegroundColor Yellow
"@ | Out-File -FilePath test.ps1 -Encoding UTF8 -Force