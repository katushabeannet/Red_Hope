function AdminLoader({ text = "Loading..." }) {
  return (
    <div className="rh-semi-wrap">
      <div className="rh-semi">
        <div><div><div><div><div><div><div><div></div></div></div></div></div></div></div></div>
      </div>
      {text && <span className="rh-semi-text">{text}</span>}
    </div>
  );
}

export default AdminLoader;
