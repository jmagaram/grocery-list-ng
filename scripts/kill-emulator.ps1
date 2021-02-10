// Kills the firebase emulator in cases where it did not shut down cleanly
// Based on this information
// https://dzhavat.github.io/2020/04/09/powershell-script-to-kill-a-process-on-windows.html
// https://stackoverflow.com/questions/39632667/how-do-i-kill-the-process-currently-using-a-port-on-localhost-in-windows
function killProcessByPort($port) {
    $foundProcesses = netstat -ano | findstr :$port
    $activePortPattern = ":$port\s.+LISTENING\s+\d+$"
    $pidNumberPattern = "\d+$"

    IF ($foundProcesses | Select-String -Pattern $activePortPattern -Quiet) {
      $allmatches = $foundProcesses | Select-String -Pattern $activePortPattern
      $firstMatch = $allmatches.Matches.Get(0).Value
      $pidNumber = [regex]::match($firstMatch, $pidNumberPattern).Value
      taskkill /pid $pidNumber /f
    }
}

killProcessByPort(9099);
killProcessByPort(5001);
killProcessByPort(8080);
killProcessByPort(5000);
