@echo off
npm install --no-audit phosphor-icons-react framer-motion@11.11.17
if %ERRORLEVEL% NEQ 0 (
  npm install --no-audit @phosphor-icons/react framer-motion@11.11.17
)
