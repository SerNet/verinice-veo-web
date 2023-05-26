#!/bin/sh
# Example usage: ./deploy-frontend.sh 1.0.0
# Example usage: ./deploy-frontend.sh 1.0.0 develop (if on a branch different from develop but you want to merge develop)
MAIN_BRANCH="master"
FALLBACK_BRANCH="develop"

#
# Validation/setting defaults
#
if [ -z "$1" ]
then
    echo "No release version provided"
    exit 1
fi

# If a second argument is provided, use that as the branch to merge into release branch, otherwise use fallback branch
if [ -n "$2" ]
then
    # If $2 isn't equal to the current branch, store in previousBranch
    if [ "$2" != "$(git rev-parse --abbrev-ref HEAD)" ]
    then
        previousBranch=$(git rev-parse --abbrev-ref HEAD)
        echo "Switching from previous branch $previousBranch to $2..."
    fi
    branchToMerge=$2
else
    branchToMerge=$FALLBACK_BRANCH
fi

#
# Merge branch to merge into release branch, based on last main branch
#
git checkout -b release/$1 origin/$MAIN_BRANCH
git merge $branchToMerge
echo "Created new release branch release/$1 based on $MAIN_BRANCH with changes from $branchToMerge"

#
# Modify files for release
#
# Open package.json and change version number
current_version=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' package.json)
sed -i "" -e "s/\"version\": \"$current_version\"/\"version\": \"$1\"/" package.json
# Run npm i to update package-lock.json version
npm i
# Update third party license file
npx generate-license-file --input ./package.json --output LICENSE-3RD-PARTY.txt --overwrite
git add .
git commit -m "Prepare for release $1"
echo "Updated package.json and LICENSE-3RD-PARTY.txt for release $1"

#
# Merge release branch into main branch
#
git checkout $MAIN_BRANCH
git merge release/$1
git branch -d release/$1
git log -1 --pretty=%B
git tag -a $1 $(git log -1 --pretty=%H) -m "Release $1"
exit 12
git push origin $MAIN_BRANCH
git push origin $1
echo "Merged release branch into $MAIN_BRANCH and pushed tag $1"

#
# Update branch to merge to state of main branch after release
#
git checkout $branchToMerge
git merge origin/$1
git push origin $branchToMerge
echo "Merged $MAIN_BRANCH into $branchToMerge"

git checkout $previousBranch
echo "Switched back to $previousBranch"
