function DeleteBtn({ onClick, title = "Delete" }) {
  return (
    <button className="rh-delete-btn" onClick={onClick} title={title}>
      <span className="db-sign">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path fill="#fff" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </span>
      <span className="db-text">Delete</span>
    </button>
  );
}

export default DeleteBtn;
