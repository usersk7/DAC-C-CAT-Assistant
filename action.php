 <?php
$servername ='localhost';
$username ='root';
$password ='root';
$dbname = "ccatdb";

// Create connection
$conn = mysqli_connect($servername,$username,$password,"$dbname");
// Check connection
if (!$conn) {
    die('Connection failed: ' .mysql_error());
}

?>



