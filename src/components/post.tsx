export default function Post(props: { text: string }) {
  return (
    <div class="card bg-base-100 shadow-2xl border-1 border-base-content">
      <div class="card-body">
        <h2 class="card-title">{props.text}</h2>
      </div>
    </div>
  );
}
