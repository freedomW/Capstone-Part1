-- Insert data into PolicyHolder table
INSERT INTO "PolicyHolder"  ("policyHolderId", email, "firstName", "lastName")
VALUES
('PH001', 'john.doe@example.com', 'John', 'Doe'),
('PH002', 'jane.smith@example.com', 'Jane', 'Smith'),
('PH003', 'mike.lee@example.com', 'Mike', 'Lee'),
('PH004', 'alice.wong@example.com', 'Alice', 'Wong'),
('PH005', 'emily.chan@example.com', 'Emily', 'Chan'),
('PH006', 'robert.oh@example.com', 'Robert', 'Oh'),
('PH007', 'lily.tan@example.com', 'Lily', 'Tan'),
('PH008', 'simon.koh@example.com', 'Simon', 'Koh');

-- Insert data into InsurancePolicy table
INSERT INTO "InsurancePolicy" ("insurancePolicyId", name, "basePriceSgd", "typeOfPolicy")
VALUES
('IP001', 'Basic Health Coverage', 500.00, 'Health Insurance'),
('IP002', 'Travel Insurance', 300.00, 'Travel Insurance'),
('IP003', 'Comprehensive Life Plan', 1200.00, 'Life Insurance'),
('IP004', 'Critical Illness Cover', 700.00, 'Critical Illness'),
('IP005', 'Car Insurance', 800.00, 'Car Insurance'),
('IP006', 'Home Insurance', 600.00, 'Home Insurance'),
('IP007', 'Family Health Package', 1500.00, 'Health Insurance'),
('IP008', 'Personal Accident Cover', 350.00, 'Personal Accident'),
('IP009', 'Overseas Medical Insurance', 400.00, 'Travel Insurance'),
('IP010', 'Business Insurance Package', 2000.00, 'Business Insurance');

INSERT INTO "PolicyAssignment" ("policyHolderId", "insurancePolicyId")
VALUES
('PH001', 'IP001'),
('PH001', 'IP002'),
('PH002', 'IP003'),
('PH002', 'IP004'),
('PH003', 'IP005'),
('PH004', 'IP006'),
('PH005', 'IP007'),
('PH005', 'IP002'),
('PH006', 'IP008'),
('PH006', 'IP002'),
('PH007', 'IP009'),
('PH008', 'IP010');