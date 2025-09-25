{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_22
    pkgs.kubo
    pkgs.go-task
  ];
}
