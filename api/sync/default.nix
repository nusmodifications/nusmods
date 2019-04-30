with (import <nixpkgs> {});
let
  gems = bundlerEnv {
    name = "nusmods-sync-server";
    inherit ruby;
    gemdir = ./.;
  };
in stdenv.mkDerivation {
  name = "nusmods-sync-server";
  buildInputs = [gems ruby];
}
