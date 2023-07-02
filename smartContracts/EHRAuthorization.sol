// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract EHRAuthorization {

    struct AuthorizationToken {
        uint256 expiration;
        mapping(string => bool) categories;
    }

    mapping(address => mapping(address => AuthorizationToken)) private authorizations;

    function addAccess(
        address doctor,
        address patient,
        uint256 expiration,
        string[] calldata categories
    ) external {
        authorizations[doctor][patient].expiration = expiration;
        for (uint256 i = 0; i < categories.length; i++) {
            authorizations[doctor][patient].categories[categories[i]] = true;
        }
    }

    function checkAccess(
        address doctor,
        address patient,
        string calldata category
    ) external view returns (bool) {
        AuthorizationToken storage auth = authorizations[doctor][patient];
        return auth.expiration > block.timestamp && auth.categories[category];
    }

}