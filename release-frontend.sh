#!/bin/sh
# Example usage: ./release-frontend.sh 1.0.0
# Example usage: ./release-frontend.sh 1.0.0 develop (if on a branch different from develop but you want to merge develop)
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
git merge origin/$branchToMerge
echo "Created new release branch release/$1 based on $MAIN_BRANCH with changes from $branchToMerge"

#
# Modify files for release
#
# Change version number
npm --no-git-tag-version $1

git add .
git commit -m "Prepare for release $1"
echo "Updated package.json for release $1"

#
# Merge release branch into main branch
#
git checkout -B $MAIN_BRANCH origin/$MAIN_BRANCH
git merge release/$1
git tag -a $1 $(git log -1 --pretty=%H) -m "Release $1"
git branch -d release/$1
git push origin $MAIN_BRANCH
git push origin $1
echo "Merged release branch into $MAIN_BRANCH and pushed tag $1"

#
# Update branch to merge to state of main branch after release
#
git checkout -B $branchToMerge origin/$branchToMerge
git merge origin/$MAIN_BRANCH
git push origin $branchToMerge
echo "Merged $MAIN_BRANCH into $branchToMerge"

git checkout $previousBranch
echo "Switched back to $previousBranch"
