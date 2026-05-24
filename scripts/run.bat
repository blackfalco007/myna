REM ================================================================
REM ASK FOR DATA END DATE
REM ================================================================

set /p DATA_END_DATE=Enter data end date (YYYY-MM-DD): 

REM ================================================================
REM DATABASE ENV VARIABLES
REM ================================================================

set DB_HOST=YOUR_REAL_RDS_HOST
set DB_PORT=5432
set DB_NAME=ebd
set DB_USER=Akshit
set DB_PASSWORD=YOUR_PASSWORD

REM ================================================================
REM GENERATE geographyHierarchy.json
REM ================================================================

echo [%date% %time%] Generating geographyHierarchy.json... >> "%LOGFILE%"

cd /d E:\Abhinandan\myna\scripts

node generate_geographyHierarchy.js %DATA_END_DATE% >> "%LOGFILE%" 2>&1

if ERRORLEVEL 1 (
  echo [%date% %time%] ERROR: geographyHierarchy generation failed. >> "%LOGFILE%"
  goto :cleanup_and_exit
)

echo [%date% %time%] geographyHierarchy.json generated successfully. >> "%LOGFILE%"

REM ================================================================
REM COPY TO FRONTEND BUILD
REM ================================================================

echo [%date% %time%] Copying geographyHierarchy.json to frontend build... >> "%LOGFILE%"

copy /Y geographyHierarchy.json \\var\\www\\build\\geographyHierarchy.json

echo [%date% %time%] geographyHierarchy.json copied successfully. >> "%LOGFILE%"