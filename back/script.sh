if [ ! "$(ls -A)" ]
then
  nest new . --package-manager yarn
  rm -rf .git
fi

yarn install
echo "yarn install done !"
nest start --watch
