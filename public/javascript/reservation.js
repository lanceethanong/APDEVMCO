function edit(id) {
    window.location.href = "/dashboard/technician/edit/" + id;
}

async function del(id) {
  try {
    const response = await fetch("/api/reservation/" + id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert("Deleted successfully");
      location.reload();
    } else {
      console.error('Failed to delete:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}