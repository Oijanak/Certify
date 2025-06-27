// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Certification {
    address public owner;
    
    struct Certificate {
        string id;
        string holderName;
        string courseName;
        uint256 issueDate;
        string issuer;
        string ipfsId;
    }
    
    // Mapping from user address to their certificates
    mapping(address => Certificate[]) private userCertificates;
    
    // Mapping from certificate ID to existence flag (for verification)
    mapping(string => bool) private certificateExists;
    
    // Event emitted when a new certificate is issued
    event CertificateIssued(
        string  certificateId,
        address indexed holder,
        string holderName,
        string courseName,
        uint256 issueDate,
        string issuer,
        string ipfsId
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Issue a new certificate to a user
     * @param _holder Address of the certificate recipient
     * @param _holderName Name of the certificate recipient
     * @param _courseName Name of the course/certification
     * @param _issuer Name of the issuing organization
     * @param _ipfsId ipfs cid to the credential 
     */
    function issueCertificate(
        string memory _certificateId,
        address _holder,
        string memory _holderName,
        string memory _courseName,
        string memory _issuer,
        string memory _ipfsId
    ) external onlyOwner {
    
        
        require(!certificateExists[_certificateId], "Certificate ID already exists");
        
        Certificate memory newCert = Certificate({
            id: _certificateId,
            holderName: _holderName,
            courseName: _courseName,
            issueDate: block.timestamp,
            issuer: _issuer,
            ipfsId: _ipfsId
        });
        
        userCertificates[_holder].push(newCert);
        certificateExists[_certificateId] = true;
        
        emit CertificateIssued(
            _certificateId,
            _holder,
            _holderName,
            _courseName,
            block.timestamp,
            _issuer,
            _ipfsId
        );
    }
    
    /**
     * @dev Get all certificates for a specific user
     * @param _user Address of the user
     * @return Array of Certificate structs
     */
    function getUserCertificates(address _user) external view returns (Certificate[] memory) {
        return userCertificates[_user];
    }
    
   /**
 * @dev Verify if a certificate with a given ID exists for a specific user
 * @param _user Address of the user
 * @param _certificateId ID of the certificate to verify
 * @return bool True if certificate exists for the user, false otherwise
 */
function verifyCertificate(address _user, string memory _certificateId) external view returns (bool) {
    Certificate[] memory certs = userCertificates[_user];
    for (uint i = 0; i < certs.length; i++) {
        if (keccak256(bytes(certs[i].id)) == keccak256(bytes(_certificateId))) {
            return true;
        }
    }
    return false;
}
    /**
     * @dev Get certificate details by ID
     * @param _user Address of the user
     * @param _certificateId ID of the certificate
     * @return Certificate struct if found
     */
    function getCertificateById(address _user, string memory _certificateId) external view returns (Certificate memory) {
        Certificate[] memory certs = userCertificates[_user];
        for (uint i = 0; i < certs.length; i++) {
             if (keccak256(bytes(certs[i].id)) == keccak256(bytes(_certificateId))) {
                return certs[i];
            }
        }
        revert("Certificate not found");
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}