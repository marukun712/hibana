import { Show } from "solid-js";
import { useAuth } from "~/contexts/authContext";

export default function Header() {
	const { user } = useAuth();

	return (
		<div class="navbar bg-primary text-white">
			<div class="navbar-start">
				<a class="btn btn-ghost text-lg md:text-xl font-bold" href="/">
					hibana
				</a>
			</div>

			<Show when={user()}>
				{(u) => {
					return (
						<div class="navbar-end">
							<div class="dropdown dropdown-end">
								<div class="btn btn-ghost btn-circle avatar">
									<div class="w-10 rounded-full">
										<img src={u().icon} alt="user avatar" />
									</div>
								</div>
							</div>
						</div>
					);
				}}
			</Show>
		</div>
	);
}
