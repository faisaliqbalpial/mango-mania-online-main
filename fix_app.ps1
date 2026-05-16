$content = [System.IO.File]::ReadAllText("c:\Antigravity\mango-mania-online-main\src\App.tsx")

# Remove the Route export block (lines 22-39)
$content = $content -replace '(?ms)export const Route = createFileRoute\("/"\)\(\{.*?\}\);[\r\n]+', ''

# Change "function Landing()" to "export default function App()"
$content = $content -replace 'function Landing\(\)', 'export default function App()'

[System.IO.File]::WriteAllText("c:\Antigravity\mango-mania-online-main\src\App.tsx", $content, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Done"
