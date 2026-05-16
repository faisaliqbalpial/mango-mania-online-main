$content = [System.IO.File]::ReadAllText("c:\Antigravity\mango-mania-online-main\src\App.tsx", [System.Text.Encoding]::UTF8)

# Update price
$content = $content -replace 'const PRICE_PER_KG = 220;', 'const PRICE_PER_KG = 110;'

# Update BN strings
$content = $content -replace '"এখনই অর্ডার করুন"', '"এখনই প্রি-অর্ডার করুন"'
$content = $content -replace 'placeOrder: "অর্ডার করুন"', 'placeOrder: "প্রি-অর্ডার করুন"'
$content = $content -replace 'summary: "অর্ডার সারাংশ"', 'summary: "প্রি-অর্ডার সারাংশ"'
$content = $content -replace 'confirm: "অর্ডার নিশ্চিত করুন"', 'confirm: "প্রি-অর্ডার নিশ্চিত করুন"'
$content = $content -replace '`অর্ডার সম্পন্ন! রেফারেন্স: \$\{ref\}`', '`প্রি-অর্ডার সম্পন্ন! রেফারেন্স: ${ref}`'

# Update EN strings
$content = $content -replace '"Order Now"', '"Pre-Order Now"'
$content = $content -replace '"Place your order"', '"Place your pre-order"'
$content = $content -replace '"Order Summary"', '"Pre-Order Summary"'
$content = $content -replace '"Confirm Order"', '"Confirm Pre-Order"'
$content = $content -replace '`Order placed! Reference: \$\{ref\}`', '`Pre-order placed! Reference: ${ref}`'

[System.IO.File]::WriteAllText("c:\Antigravity\mango-mania-online-main\src\App.tsx", $content, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Updated price and text."
