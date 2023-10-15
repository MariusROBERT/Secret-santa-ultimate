if [ ! "$(ls -A)" ]
then
  yarn create vite . --template react-ts
fi

yarn install
echo "yarn install done !"
yarn run dev --host