// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Certification {
    address public owner;
    
    struct Certificate {
        uint256 id;
        string holderName;
        string courseName;
        uint256 issueDate;
        string issuer;
        string credentialUrl;
    }
    
    // Mapping from user address to their certificates
    mapping(address => Certificate[]) private userCertificates;
    
    // Mapping from certificate ID to existence flag (for verification)
    mapping(uint256 => bool) private certificateExists;
    
    // Event emitted when a new certificate is issued
    event CertificateIssued(
        uint256 indexed id,
        address indexed holder,
        string holderName,
        string courseName,
        uint256 issueDate,
        string issuer
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
     * @param _credentialUrl URL to the credential (optional)
     */
    function issueCertificate(
        address _holder,
        string memory _holderName,
        string memory _courseName,
        string memory _issuer,
        string memory _credentialUrl
    ) external onlyOwner {
        uint256 certificateId = uint256(keccak256(abi.encodePacked(
            _holder,
            _holderName,
            _courseName,
            block.timestamp
        )));
        
        require(!certificateExists[certificateId], "Certificate ID already exists");
        
        Certificate memory newCert = Certificate({
            id: certificateId,
            holderName: _holderName,
            courseName: _courseName,
            issueDate: block.timestamp,
            issuer: _issuer,
            credentialUrl: _credentialUrl
        });
        
        userCertificates[_holder].push(newCert);
        certificateExists[certificateId] = true;
        
        emit CertificateIssued(
            certificateId,
            _holder,
            _holderName,
            _courseName,
            block.timestamp,
            _issuer
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
     * @dev Verify if a certificate exists
     * @param _certificateId ID of the certificate to verify
     * @return bool True if certificate exists, false otherwise
     */
    function verifyCertificate(uint256 _certificateId) external view returns (bool) {
        return certificateExists[_certificateId];
    }
    
    /**
     * @dev Get certificate details by ID
     * @param _user Address of the user
     * @param _certificateId ID of the certificate
     * @return Certificate struct if found
     */
    function getCertificateById(address _user, uint256 _certificateId) external view returns (Certificate memory) {
        Certificate[] memory certs = userCertificates[_user];
        for (uint i = 0; i < certs.length; i++) {
            if (certs[i].id == _certificateId) {
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