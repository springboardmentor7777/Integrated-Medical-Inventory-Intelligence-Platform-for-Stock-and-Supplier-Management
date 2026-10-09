package com.medistock.config;

import com.medistock.entity.*;
import com.medistock.enums.*;
import com.medistock.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final BatchRepository batchRepository;
    private final StockLogRepository stockLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            SupplierRepository supplierRepository,
            MedicineRepository medicineRepository,
            InventoryRepository inventoryRepository,
            BatchRepository batchRepository,
            StockLogRepository stockLogRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.batchRepository = batchRepository;
        this.stockLogRepository = stockLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and initializing MediStock development seed data...");
        seedRoles();
        seedUsers();
        seedCategories();
        seedSuppliers();
        seedMedicinesAndInventory();
        log.info("MediStock seed data initialization complete.");
    }

    private void seedRoles() {
        createRoleIfNotFound(RoleName.ADMIN, "System Administrator", "Full unrestricted access to all services, user roles, security settings, and inventory.");
        createRoleIfNotFound(RoleName.PHARMACIST, "Clinical Pharmacist", "Manage medicine inventory, dispense stock, manage batches, and create restock requests.");
        createRoleIfNotFound(RoleName.STAFF, "General Staff", "Basic access to view inventory items and check stock availability.");
        createRoleIfNotFound(RoleName.INVENTORY_MANAGER, "Inventory & Supply Manager", "Supplier orders, receiving shipments, stock adjustments, and inventory monitoring.");
        createRoleIfNotFound(RoleName.DOCTOR, "Medical Doctor", "View medicine catalog, check availability, and request prescriptions.");
        createRoleIfNotFound(RoleName.NURSE, "Staff Nurse", "Check medicine stock levels and dispense medications at ward units.");
    }

    private Role createRoleIfNotFound(RoleName name, String displayName, String description) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role(name, displayName, description);
            log.info("Seeding Role: {}", name);
            return roleRepository.save(role);
        });
    }

    private void seedUsers() {
        Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElseThrow();
        Role pharmacistRole = roleRepository.findByName(RoleName.PHARMACIST).orElseThrow();

        // 1. Admin User
        if (!userRepository.existsByEmailIgnoreCase("admin@medistock.com")) {
            User admin = new User(
                    "Dr. Sarah Jenkins",
                    "admin@medistock.com",
                    passwordEncoder.encode("admin123"),
                    adminRole,
                    "Hospital Administration & Pharmacy Board",
                    "+1 (555) 019-2834",
                    "ADM-99820-US"
            );
            admin.setBio("Chief Medical Officer & Administrator. Managing pharmacy regulatory compliance and hospital operations.");
            admin.setAvatarStyle("admin");
            userRepository.save(admin);
            log.info("Seeded Admin user: admin@medistock.com / admin123 (Development credentials)");
        }

        // 2. Pharmacist User
        if (!userRepository.existsByEmailIgnoreCase("pharmacist@medistock.com")) {
            User pharmacist = new User(
                    "Alex Mercer, PharmD",
                    "pharmacist@medistock.com",
                    passwordEncoder.encode("admin123"),
                    pharmacistRole,
                    "Inpatient Central Pharmacy",
                    "+1 (555) 234-5678",
                    "PH-884920-US"
            );
            pharmacist.setBio("Clinical Pharmacist leading inpatient medication dispensing and cold-chain compliance.");
            pharmacist.setAvatarStyle("pharmD");
            userRepository.save(pharmacist);
            log.info("Seeded Pharmacist user: pharmacist@medistock.com / admin123");
        }
    }

    private void seedCategories() {
        createCategoryIfNotFound("Antibiotics", "CAT-ANT", "Bacterial infection treatments and penicillin derivatives", "Room Temperature (15-25°C)");
        createCategoryIfNotFound("Analgesics & Pain Relievers", "CAT-ANA", "Pain relief, antipyretics and anti-inflammatory drugs", "Dry & Cool place");
        createCategoryIfNotFound("Cardiovascular", "CAT-CRD", "Heart, cholesterol and hypertension control medications", "Room Temperature (15-25°C)");
        createCategoryIfNotFound("Antidiabetics & Hormones", "CAT-DIA", "Insulin, GLP-1 analogs and glucose regulators", "Cold Chain (2-8°C)");
        createCategoryIfNotFound("Respiratory & Antiallergic", "CAT-RES", "Bronchodilators, antihistamines and inhalers", "Protect from sunlight");
        createCategoryIfNotFound("Vitamins & Minerals", "CAT-VIT", "Therapeutic supplements and micronutrients", "Dry place");
    }

    private void createCategoryIfNotFound(String name, String code, String description, String storage) {
        if (!categoryRepository.existsByCodeIgnoreCase(code)) {
            Category category = new Category(name, code, description, storage);
            categoryRepository.save(category);
        }
    }

    private void seedSuppliers() {
        if (!supplierRepository.existsByNameIgnoreCase("Apex Pharmaceuticals Ltd")) {
            Supplier s1 = new Supplier("Apex Pharmaceuticals Ltd", "David Vance", "orders@apexpharma.com", "+1 (555) 432-8901", "450 Science Park Way, Boston, MA");
            s1.setTaxId("US-TAX-892019");
            s1.setPaymentTerms("Net 30");
            s1.setRating(4.9);
            supplierRepository.save(s1);
        }

        if (!supplierRepository.existsByNameIgnoreCase("Global Health Distribution")) {
            Supplier s2 = new Supplier("Global Health Distribution", "Maria Rodriguez", "supply@globalhealth.org", "+1 (555) 789-2341", "102 Industrial Blvd, Chicago, IL");
            s2.setTaxId("US-TAX-445102");
            s2.setPaymentTerms("Net 45");
            s2.setRating(4.6);
            supplierRepository.save(s2);
        }

        if (!supplierRepository.existsByNameIgnoreCase("BioMed Life Sciences")) {
            Supplier s3 = new Supplier("BioMed Life Sciences", "Dr. Arthur Chen", "biologics@biomedsciences.com", "+1 (555) 901-6745", "78 BioTech Lane, San Diego, CA");
            s3.setTaxId("US-TAX-778901");
            s3.setPaymentTerms("Net 15");
            s3.setRating(4.8);
            supplierRepository.save(s3);
        }
    }

    private void seedMedicinesAndInventory() {
        if (medicineRepository.count() > 0) {
            return;
        }

        Optional<Category> catAntibiotics = categoryRepository.findByCodeIgnoreCase("CAT-ANT");
        Optional<Category> catAnalgesics = categoryRepository.findByCodeIgnoreCase("CAT-ANA");
        Optional<Category> catAntidiabetics = categoryRepository.findByCodeIgnoreCase("CAT-DIA");
        Optional<Category> catCardiovascular = categoryRepository.findByCodeIgnoreCase("CAT-CRD");

        Optional<Supplier> supplierApex = supplierRepository.findByNameIgnoreCase("Apex Pharmaceuticals Ltd");
        Optional<Supplier> supplierGlobal = supplierRepository.findByNameIgnoreCase("Global Health Distribution");
        Optional<Supplier> supplierBiomed = supplierRepository.findByNameIgnoreCase("BioMed Life Sciences");

        if (catAntibiotics.isEmpty() || supplierApex.isEmpty()) return;

        // 1. Amoxicillin
        Medicine med1 = new Medicine(
                "Amoxicillin Trihydrate 500mg",
                "MED-AMX-500",
                catAntibiotics.get(),
                supplierApex.get(),
                "Capsules",
                "Room Temperature (15-25°C)",
                "Broad-spectrum penicillin antibiotic capsules for bacterial infections",
                14.50,
                30
        );
        med1.setNearestExpiryDate(LocalDate.of(2027, 12, 15));
        med1.setStockStatus(StockStatus.IN_STOCK);
        med1.setExpiryStatus(ExpiryStatus.VALID);
        medicineRepository.save(med1);

        Inventory inv1 = new Inventory(med1, 150, 30);
        inventoryRepository.save(inv1);

        Batch batch1 = new Batch(med1, "BAT-AMX-2025A", 150, LocalDate.of(2025, 1, 10), LocalDate.of(2027, 12, 15), 9.20);
        batchRepository.save(batch1);

        User adminUser = userRepository.findByEmailIgnoreCase("admin@medistock.com").orElse(null);
        StockLog log1 = new StockLog(
                med1,
                "BAT-AMX-2025A",
                StockMovementType.IN,
                AdjustmentReason.INITIAL_STOCK,
                150,
                0,
                150,
                adminUser,
                adminUser != null ? adminUser.getName() : "System Admin",
                "INIT-2025-001",
                "Initial inventory intake"
        );
        stockLogRepository.save(log1);

        // 2. Paracetamol (Low stock)
        Medicine med2 = new Medicine(
                "Paracetamol 650mg (Dolo)",
                "MED-PCM-650",
                catAnalgesics.orElse(catAntibiotics.get()),
                supplierGlobal.orElse(supplierApex.get()),
                "Tablets",
                "Dry & Cool place",
                "Analgesic and antipyretic tablets for pain and fever control",
                6.00,
                50
        );
        med2.setNearestExpiryDate(LocalDate.of(2027, 6, 20));
        med2.setStockStatus(StockStatus.LOW_STOCK);
        med2.setExpiryStatus(ExpiryStatus.VALID);
        medicineRepository.save(med2);

        Inventory inv2 = new Inventory(med2, 12, 50);
        inventoryRepository.save(inv2);

        Batch batch2 = new Batch(med2, "BAT-PCM-2025B", 12, LocalDate.of(2025, 2, 15), LocalDate.of(2027, 6, 20), 3.50);
        batchRepository.save(batch2);

        StockLog log2 = new StockLog(
                med2,
                "BAT-PCM-2025B",
                StockMovementType.IN,
                AdjustmentReason.INITIAL_STOCK,
                12,
                0,
                12,
                adminUser,
                adminUser != null ? adminUser.getName() : "System Admin",
                "INIT-2025-002",
                "Initial inventory intake"
        );
        stockLogRepository.save(log2);

        // 3. Metformin (Out of stock)
        Medicine med3 = new Medicine(
                "Metformin HCl 500mg",
                "MED-MET-500",
                catAntidiabetics.orElse(catAntibiotics.get()),
                supplierApex.get(),
                "Tablets",
                "Room Temperature (15-25°C)",
                "First-line medication for type 2 diabetes blood sugar management",
                18.75,
                25
        );
        med3.setNearestExpiryDate(LocalDate.of(2027, 1, 10));
        med3.setStockStatus(StockStatus.OUT_OF_STOCK);
        med3.setExpiryStatus(ExpiryStatus.VALID);
        medicineRepository.save(med3);

        Inventory inv3 = new Inventory(med3, 0, 25);
        inventoryRepository.save(inv3);

        Batch batch3 = new Batch(med3, "BAT-MET-2024X", 0, LocalDate.of(2024, 3, 1), LocalDate.of(2027, 1, 10), 11.00);
        batchRepository.save(batch3);

        // 4. Insulin Glargine (Expiring soon)
        Medicine med4 = new Medicine(
                "Insulin Glargine 100IU/ml Pen",
                "MED-INS-100",
                catAntidiabetics.orElse(catAntibiotics.get()),
                supplierBiomed.orElse(supplierApex.get()),
                "Injectable Pen",
                "Cold Chain (2-8°C)",
                "Long-acting basal insulin analog for 24-hour glycemic control",
                85.00,
                15
        );
        med4.setNearestExpiryDate(LocalDate.of(2026, 9, 12));
        med4.setStockStatus(StockStatus.IN_STOCK);
        med4.setExpiryStatus(ExpiryStatus.EXPIRING_SOON);
        medicineRepository.save(med4);

        Inventory inv4 = new Inventory(med4, 40, 15);
        inventoryRepository.save(inv4);

        Batch batch4 = new Batch(med4, "BAT-INS-2025C", 40, LocalDate.of(2025, 1, 5), LocalDate.of(2026, 9, 12), 60.00);
        batch4.setExpiryStatus(ExpiryStatus.EXPIRING_SOON);
        batchRepository.save(batch4);

        // 5. Atorvastatin
        Medicine med5 = new Medicine(
                "Atorvastatin Calcium 20mg",
                "MED-ATO-020",
                catCardiovascular.orElse(catAntibiotics.get()),
                supplierApex.get(),
                "Tablets",
                "Room Temperature (15-25°C)",
                "Statin lipid-lowering medication used to prevent cardiovascular disease",
                32.50,
                30
        );
        med5.setNearestExpiryDate(LocalDate.of(2028, 4, 30));
        med5.setStockStatus(StockStatus.IN_STOCK);
        med5.setExpiryStatus(ExpiryStatus.VALID);
        medicineRepository.save(med5);

        Inventory inv5 = new Inventory(med5, 200, 30);
        inventoryRepository.save(inv5);

        Batch batch5 = new Batch(med5, "BAT-ATO-2025D", 200, LocalDate.of(2025, 4, 1), LocalDate.of(2028, 4, 30), 20.00);
        batchRepository.save(batch5);

        log.info("Seeded initial medicine catalog, inventory, and stock log records.");
    }
}
